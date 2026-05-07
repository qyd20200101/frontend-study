var reverseList = function (head) {
  let curr = head;
  let pre = null;
  while (curr !== null) {
    let next = curr.next;
    curr.next = pre;
    pre = curr;
    curr = next;
  }

  return pre;
};
var hasCycle = function (head) {
  if (head === null) {
    return false;
  }
  let slow = head;
  let fast = head.next;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }
  return false;
};
//合并有序链表
var mergeTwoLists = function (list1, list2) {
  let dummy = new ListNode(-1);
  let curr = dummy;
  while (list1 !== null && list2 !== null) {
    if (list1.val < list2.val) {
      curr.next = list1;
      list1 = list1.next;
    } else {
      curr.next = list2;
      list2 = list2.next;
    }
    curr = curr.next;
  }
  curr.next = list1 !== null ? list1 : list2;
  return dummy.next;
};
//找到链表中间节点
var middleNode = function (head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
};
var headAB = function (headA, headB) {
  let pA = headA;
  let pB = headB;

  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }

  return pA;
};
var removeNthFromEnd = function (head, n) {
  let dummy = head;
  let slow = dummy;
  let fast = dummy;
  fast = fast.next + n;
  while (fast !== null) {
    slow = slow.next;
    fast = fast.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
};
